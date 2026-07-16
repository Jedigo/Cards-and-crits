extends Node3D
## Builds a 3D battle board from a scene entry in gameData.json:
## zone tiles laid out like the React prototype's map, connection paths,
## and minis for the party + scene enemies.

const MiniScript := preload("res://scripts/mini.gd")

const TILE_W := 3.0
const TILE_D := 2.0
const TILE_H := 0.25
const ELEVATED_H := 0.7
const MINI_SPACING := 0.7

const TAG_COLORS := {
	"elevated": Color("6a5c40"),
	"cover": Color("3a5c34"),
	"shadowed": Color("3a3852"),
	"open": Color("5a4228"),
	"chaotic": Color("5c3a24"),
	"tight": Color("4a4a30"),
	"exposed": Color("5c5038"),
	"difficult": Color("4a3418"),
}
const DEFAULT_TILE_COLOR := Color("4a3c2c")

var minis: Array[Mini] = []

func build(scene_data: Dictionary) -> void:
	for child in get_children():
		child.queue_free()
	minis.clear()

	var env := GameData.environment_by_id(scene_data.get("environmentId", ""))
	if env.is_empty():
		push_error("Unknown environment for scene %s" % scene_data.get("id", "?"))
		return

	var zones: Array = env.get("zones", [])
	var positions := _zone_positions(zones)
	var heights := {}
	for zone in zones:
		heights[zone["id"]] = ELEVATED_H if "elevated" in zone.get("tags", []) else TILE_H

	_build_connections(zones, positions, heights)
	for zone in zones:
		_build_tile(zone, positions[zone["id"]], heights[zone["id"]])

	_spawn_minis(env, scene_data, positions, heights)

## Zone layouts ported from the React prototype (RangeBandDisc.jsx),
## mapped onto the XZ plane in world units.
func _zone_positions(zones: Array) -> Dictionary:
	var n := zones.size()
	var pos := {}
	if n == 1:
		pos[zones[0]["id"]] = Vector2.ZERO
	elif n == 2:
		pos[zones[0]["id"]] = Vector2(0, -1.8)
		pos[zones[1]["id"]] = Vector2(0, 1.8)
	elif n == 3:
		pos[zones[0]["id"]] = Vector2(-3.1, 1.4)
		pos[zones[1]["id"]] = Vector2(0, -1.6)
		pos[zones[2]["id"]] = Vector2(3.1, 1.4)
	elif n == 4:
		pos[zones[0]["id"]] = Vector2(0, -2.5)
		pos[zones[1]["id"]] = Vector2(0, 0.3)
		pos[zones[2]["id"]] = Vector2(-3.5, 2.7)
		pos[zones[3]["id"]] = Vector2(3.5, 2.7)
	else:
		for i in n:
			var angle := float(i) / n * TAU - PI / 2
			pos[zones[i]["id"]] = Vector2(cos(angle) * 3.4, sin(angle) * 3.4 * 0.7)
	return pos

func _tile_color(tags: Array) -> Color:
	for tag in tags:
		if TAG_COLORS.has(tag):
			return TAG_COLORS[tag]
	return DEFAULT_TILE_COLOR

func _build_tile(zone: Dictionary, pos2: Vector2, height: float) -> void:
	var tags: Array = zone.get("tags", [])
	var color := _tile_color(tags)

	var mesh := BoxMesh.new()
	mesh.size = Vector3(TILE_W, height, TILE_D)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.9
	mesh.material = mat

	var tile := MeshInstance3D.new()
	tile.mesh = mesh
	tile.position = Vector3(pos2.x, height / 2.0, pos2.y)
	add_child(tile)

	var label := Label3D.new()
	label.text = zone.get("name", "?")
	label.font_size = 36
	label.outline_size = 8
	label.pixel_size = 0.006
	label.modulate = Color("d4a574")
	label.rotation_degrees = Vector3(-90, 0, 0)
	label.position = Vector3(pos2.x, height + 0.01, pos2.y + TILE_D / 2.0 - 0.22)
	add_child(label)

	var shown_tags := tags.filter(func(t): return t != "open")
	if not shown_tags.is_empty():
		var tag_label := Label3D.new()
		tag_label.text = " · ".join(PackedStringArray(shown_tags))
		tag_label.font_size = 24
		tag_label.outline_size = 6
		tag_label.pixel_size = 0.006
		tag_label.modulate = Color("9a8a6a")
		tag_label.rotation_degrees = Vector3(-90, 0, 0)
		tag_label.position = Vector3(pos2.x, height + 0.01, pos2.y - TILE_D / 2.0 + 0.2)
		add_child(tag_label)

func _build_connections(zones: Array, positions: Dictionary, heights: Dictionary) -> void:
	for zone in zones:
		for conn_id in zone.get("connections", []):
			if String(zone["id"]) > String(conn_id):
				continue
			if not positions.has(conn_id):
				continue
			var a: Vector2 = positions[zone["id"]]
			var b: Vector2 = positions[conn_id]
			var dist := a.distance_to(b)

			var mesh := BoxMesh.new()
			mesh.size = Vector3(dist, 0.04, 0.16)
			var mat := StandardMaterial3D.new()
			mat.albedo_color = Color("7a6a50", 0.9)
			mat.roughness = 1.0
			mesh.material = mat

			var path := MeshInstance3D.new()
			path.mesh = mesh
			var mid := (a + b) / 2.0
			path.position = Vector3(mid.x, 0.02, mid.y)
			path.rotation.y = -atan2(b.y - a.y, b.x - a.x)
			add_child(path)

func _spawn_minis(env: Dictionary, scene_data: Dictionary, positions: Dictionary, heights: Dictionary) -> void:
	var occupants_by_zone := {}

	var start_zone: String = env.get("playerStart", "")
	for hero in GameData.heroes():
		occupants_by_zone[start_zone] = occupants_by_zone.get(start_zone, [])
		occupants_by_zone[start_zone].append({
			"name": hero["name"], "model_id": hero["id"], "faction": "hero",
		})

	var suffix := RegEx.create_from_string("_\\d+$")
	for enemy in scene_data.get("enemies", []):
		var zone_id: String = enemy.get("startZone", start_zone)
		occupants_by_zone[zone_id] = occupants_by_zone.get(zone_id, [])
		occupants_by_zone[zone_id].append({
			"name": enemy["name"],
			# bandit_fighter_1 / _2 share one model file: bandit_fighter.glb
			"model_id": suffix.sub(enemy["id"], "", true),
			"faction": "enemy",
		})

	for zone_id in occupants_by_zone:
		if not positions.has(zone_id):
			continue
		var pos2: Vector2 = positions[zone_id]
		var height: float = heights[zone_id]
		var group: Array = occupants_by_zone[zone_id]
		for i in group.size():
			var offset_x := (i - (group.size() - 1) / 2.0) * MINI_SPACING
			var mini: Mini = MiniScript.new()
			mini.setup(group[i]["name"], group[i]["model_id"], group[i]["faction"], i)
			mini.position = Vector3(pos2.x + offset_x, height, pos2.y + (0.35 if group[i]["faction"] == "hero" else -0.2))
			add_child(mini)
			minis.append(mini)
