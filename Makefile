generate_backend_from_source_spec:
	openapi-generator generate -g go-server -o ./backend -i ./spec/petstore-separate/spec/swagger.json
