extends Node3D
## Orbit camera rig for the tabletop view.
## Right-mouse drag orbits, scroll wheel zooms, Q/E rotate, R resets.

const DEFAULT_YAW := 0.0
const DEFAULT_PITCH := -52.0
const DEFAULT_DIST := 12.5

var yaw := DEFAULT_YAW
var pitch := DEFAULT_PITCH
var dist := DEFAULT_DIST
var target := Vector3(0, 0.4, 0)

var _camera: Camera3D

func _ready() -> void:
	_camera = Camera3D.new()
	_camera.fov = 45.0
	add_child(_camera)
	# Debug hook: BOARD_CAM="yaw,pitch,dist[,tx,ty,tz]" positions the camera
	# for screenshot captures (pairs with BOARD_SCREENSHOT in main.gd).
	var cam_env := OS.get_environment("BOARD_CAM")
	if cam_env != "":
		var parts := cam_env.split(",")
		if parts.size() >= 3:
			yaw = parts[0].to_float()
			pitch = parts[1].to_float()
			dist = parts[2].to_float()
		if parts.size() >= 6:
			target = Vector3(parts[3].to_float(), parts[4].to_float(), parts[5].to_float())
	_update_camera()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			dist = clampf(dist - 0.8, 5.0, 20.0)
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			dist = clampf(dist + 0.8, 5.0, 20.0)
	elif event is InputEventMouseMotion and Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
		yaw -= event.relative.x * 0.35
		pitch = clampf(pitch - event.relative.y * 0.25, -85.0, -15.0)
	elif event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_Q:
				yaw += 15.0
			KEY_E:
				yaw -= 15.0
			KEY_R:
				yaw = DEFAULT_YAW
				pitch = DEFAULT_PITCH
				dist = DEFAULT_DIST
	_update_camera()

func _update_camera() -> void:
	var pitch_rad := deg_to_rad(pitch)
	var yaw_rad := deg_to_rad(yaw)
	var offset := Vector3(
		sin(yaw_rad) * cos(pitch_rad),
		-sin(pitch_rad),
		cos(yaw_rad) * cos(pitch_rad)
	) * dist
	_camera.position = target + offset
	_camera.look_at_from_position(_camera.position, target, Vector3.UP)
