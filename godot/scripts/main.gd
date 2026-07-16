extends Node3D
## Entry point: sets up the tabletop (lighting, table, camera, HUD),
## builds the battle board for a scene from gameData.json, and handles
## scene switching (1/2/3) and click-to-select on enemy minis.

const BattleBoard := preload("res://scripts/battle_board.gd")
const OrbitCamera := preload("res://scripts/orbit_camera.gd")

var board: Node3D
var hud: Label
var scene_index := 0

func _ready() -> void:
	_setup_environment()
	_setup_table()
	_setup_hud()

	var rig := OrbitCamera.new()
	add_child(rig)

	board = BattleBoard.new()
	add_child(board)
	_load_scene(0)

	# Debug hook: BOARD_SCREENSHOT=/path.png (+ optional BOARD_SCENE=N) captures
	# the board and quits — used for headless-ish visual checks during development.
	var shot_path := OS.get_environment("BOARD_SCREENSHOT")
	if shot_path != "":
		var scene_env := OS.get_environment("BOARD_SCENE")
		if scene_env != "":
			_load_scene(scene_env.to_int() - 1)
		_capture_screenshot(shot_path)

func _capture_screenshot(path: String) -> void:
	for i in 30:
		await get_tree().process_frame
	get_viewport().get_texture().get_image().save_png(path)
	get_tree().quit()

func _setup_environment() -> void:
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("14100b")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("8a7a62")
	env.ambient_light_energy = 0.7
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	var world_env := WorldEnvironment.new()
	world_env.environment = env
	add_child(world_env)

	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-52, -28, 0)
	sun.light_energy = 1.3
	sun.light_color = Color("ffefd8")
	sun.shadow_enabled = true
	add_child(sun)

func _setup_table() -> void:
	var mesh := BoxMesh.new()
	mesh.size = Vector3(40, 0.2, 40)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color("241a10")
	mat.roughness = 0.95
	mesh.material = mat
	var table := MeshInstance3D.new()
	table.mesh = mesh
	table.position.y = -0.1
	add_child(table)

func _setup_hud() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	hud = Label.new()
	hud.position = Vector2(16, 12)
	hud.add_theme_font_size_override("font_size", 16)
	hud.add_theme_color_override("font_color", Color("d4a574"))
	layer.add_child(hud)

func _load_scene(index: int) -> void:
	var scenes := GameData.scenes()
	if scenes.is_empty():
		hud.text = "No scenes found in gameData.json"
		return
	scene_index = clampi(index, 0, scenes.size() - 1)
	var scene_data: Dictionary = scenes[scene_index]
	board.build(scene_data)
	_update_hud(scene_data, "")

func _update_hud(scene_data: Dictionary, selected: String) -> void:
	var lines := [
		scene_data.get("title", "?"),
		"1-%d: switch scene   RMB drag: orbit   wheel: zoom   Q/E rotate   R reset" % GameData.scenes().size(),
		"Drop Tripo models into assets/models/ named <id>.glb (see README)",
	]
	if selected != "":
		lines.append("Target: " + selected)
	hud.text = "\n".join(lines)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed:
		var num: int = event.keycode - KEY_1
		if num >= 0 and num < GameData.scenes().size():
			_load_scene(num)
	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_try_select(event.position)

func _try_select(screen_pos: Vector2) -> void:
	var camera := get_viewport().get_camera_3d()
	if camera == null:
		return
	var from := camera.project_ray_origin(screen_pos)
	var to := from + camera.project_ray_normal(screen_pos) * 100.0
	var query := PhysicsRayQueryParameters3D.create(from, to)
	var hit := get_world_3d().direct_space_state.intersect_ray(query)
	if hit.is_empty():
		return
	var collider: Node = hit["collider"]
	var node := collider.get_parent()
	if node is Mini and node.faction == "enemy":
		for mini in board.minis:
			mini.selected = (mini == node)
		_update_hud(GameData.scenes()[scene_index], node.unit_name)
