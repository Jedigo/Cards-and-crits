class_name Mini
extends Node3D
## One miniature on the board. Loads res://assets/models/<model_id>.glb if it
## exists (drop Tripo exports there), otherwise builds a placeholder capsule.
## Either way it gets a faction-colored base, a name label, and a click body.

const TARGET_HEIGHT := 1.3
const HERO_BASE_COLOR := Color("2980b9")
const ENEMY_BASE_COLOR := Color("c0392b")

var unit_name := ""
var model_id := ""
var faction := "hero"
var label_row := 0
var selected := false:
	set(value):
		selected = value
		if _ring:
			_ring.visible = value

var _ring: MeshInstance3D

func setup(p_name: String, p_model_id: String, p_faction: String, p_label_row := 0) -> void:
	unit_name = p_name
	model_id = p_model_id
	faction = p_faction
	label_row = p_label_row

func _ready() -> void:
	var base_color := HERO_BASE_COLOR if faction == "hero" else ENEMY_BASE_COLOR
	_build_base(base_color)
	_build_ring()
	_build_label()
	_build_click_body()

	var model_path := "res://assets/models/%s.glb" % model_id
	if ResourceLoader.exists(model_path):
		var packed: PackedScene = load(model_path)
		var model: Node3D = packed.instantiate()
		add_child(model)
		_fit_model(model)
	else:
		_build_placeholder(base_color)

func _build_placeholder(color: Color) -> void:
	var mesh := CapsuleMesh.new()
	mesh.radius = 0.22
	mesh.height = 0.95
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color.lightened(0.15)
	mat.roughness = 0.7
	mesh.material = mat
	var mi := MeshInstance3D.new()
	mi.mesh = mesh
	mi.position.y = 0.475 + 0.06
	add_child(mi)

func _build_base(color: Color) -> void:
	var mesh := CylinderMesh.new()
	mesh.top_radius = 0.32
	mesh.bottom_radius = 0.36
	mesh.height = 0.06
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color.darkened(0.3)
	mat.roughness = 0.4
	mesh.material = mat
	var mi := MeshInstance3D.new()
	mi.mesh = mesh
	mi.position.y = 0.03
	add_child(mi)

func _build_ring() -> void:
	var mesh := TorusMesh.new()
	mesh.inner_radius = 0.38
	mesh.outer_radius = 0.46
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color("f1c40f")
	mat.emission_enabled = true
	mat.emission = Color("f1c40f")
	mat.emission_energy_multiplier = 0.8
	mesh.material = mat
	_ring = MeshInstance3D.new()
	_ring.mesh = mesh
	_ring.position.y = 0.02
	_ring.visible = false
	add_child(_ring)

func _build_label() -> void:
	var label := Label3D.new()
	label.text = unit_name
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.font_size = 30
	label.outline_size = 8
	label.pixel_size = 0.006
	# Stagger neighboring labels vertically so names don't overlap when
	# several minis share a zone.
	label.position.y = TARGET_HEIGHT + 0.3 + (label_row % 2) * 0.26
	label.modulate = Color("f5e6c8")
	add_child(label)

func _build_click_body() -> void:
	var body := StaticBody3D.new()
	var shape := CollisionShape3D.new()
	var capsule := CapsuleShape3D.new()
	capsule.radius = 0.35
	capsule.height = TARGET_HEIGHT
	shape.shape = capsule
	shape.position.y = TARGET_HEIGHT / 2.0
	body.add_child(shape)
	add_child(body)

## Uniformly scale an imported model so it stands TARGET_HEIGHT tall,
## centered on the base with its feet at y=0 (Tripo exports vary wildly in scale).
func _fit_model(model: Node3D) -> void:
	var boxes: Array[AABB] = []
	_collect_aabbs(model, Transform3D.IDENTITY, boxes)
	if boxes.is_empty():
		return
	var aabb: AABB = boxes[0]
	for i in range(1, boxes.size()):
		aabb = aabb.merge(boxes[i])
	if aabb.size.y <= 0.001:
		return
	var s := TARGET_HEIGHT / aabb.size.y
	model.scale = Vector3.ONE * s
	var center := aabb.get_center()
	model.position = Vector3(-center.x * s, -aabb.position.y * s + 0.06, -center.z * s)

func _collect_aabbs(node: Node, xform: Transform3D, out: Array[AABB]) -> void:
	var local := xform
	if node is Node3D:
		local = xform * (node as Node3D).transform
	if node is MeshInstance3D:
		out.append(local * (node as MeshInstance3D).get_aabb())
	for child in node.get_children():
		_collect_aabbs(child, local, out)
