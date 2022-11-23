

generate-server: 
	swagger generate server --spec spec/petstore-separate/spec/swagger.json --target ./backend

compile: 
	go build backend/cmd/swagger-petstore-server/main.go

run-compiled: 
	./main 


