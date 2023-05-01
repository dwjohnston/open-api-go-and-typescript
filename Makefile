backend-build: 
	cd backend && go build main.go

backend-run: 
	PET_NAME_SERVICE_URL="https://jsonplaceholder.typicode.com/users" ./backend/main

generate_backend_from_source_spec:
	openapi-generator generate -g go-server -o ./backend -i ./spec/petstore-separate/spec/swagger.json

generate_test_runner_client_from_source_spec: 
	openapi-generator generate -g typescript-fetch -o ./api-test-runner-jest/generated -i ./spec/petstore-separate/spec/swagger.json


start_redis: 
	docker run -d --name mockbin_redis redis

start_mockbin: 
	docker run -d --name mockbin -p 8081:8080 --link mockbin_redis:redis brianlow/mockbin

stop_redis: 
	docker stop mockbin_redis && docker rm mockbin_redis

stop_mockbin: 
	docker stop mockbin && docker rm mockbin


