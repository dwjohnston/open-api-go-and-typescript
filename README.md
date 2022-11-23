## Notes


# backend
- Using go-swagger 0.30.3 installed via homebrew. 
  - See various notes about go-swagger versions here: https://github.com/go-swagger/go-swagger/issues/2860
  - This appears to not support OpenAPI v3. 
  - Copied petstore example for OpenAPI v2 from here: https://github.com/OAI/OpenAPI-Specification/tree/main/examples/v2.0/json/petstore-separate


  - `swagger generate server` appears to want:
    - a go.mod


# backend2

Generated via `openapi-generator-cli` install from yarn 

Not sure what's going on with this one - it appears to generate a bunch of types that don't exist. 



# backend3

Like above `openapi-generator` installed via homebrew. 

Has the same problems as above. 

