extends Node
## Loads gameData.json — the same file the React prototype uses
## (symlinked at res://data/gameData.json so balance edits stay single-source).

var data: Dictionary = {}

func _ready() -> void:
	var file := FileAccess.open("res://data/gameData.json", FileAccess.READ)
	if file == null:
		push_error("gameData.json not found at res://data/gameData.json")
		return
	var parsed = JSON.parse_string(file.get_as_text())
	if parsed is Dictionary:
		data = parsed
	else:
		push_error("gameData.json failed to parse")

func scenes() -> Array:
	return data.get("scenes", [])

func heroes() -> Array:
	return data.get("heroes", [])

func scene_by_id(scene_id: String) -> Dictionary:
	for s in scenes():
		if s.get("id", "") == scene_id:
			return s
	return {}

func environment_by_id(env_id: String) -> Dictionary:
	for env in data.get("environments", []):
		if env.get("id", "") == env_id:
			return env
	return {}
