generate_backend_from_source_spec:
	openapi-generator generate -g go-server -o ./backend -i ./spec/petstore-separate/spec/swagger.json

generate_test_runner_client_from_source_spec: 
	openapi-generator generate -g typescript-fetch -o ./api-test-runner-jest/generated -i ./spec/petstore-separate/spec/swagger.json

docker-build: 
	docker build -t openapi-go-and-typescript .

docker-run: 
	docker run -p 80:80 openapi-go-and-typescript
