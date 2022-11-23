// Code generated by go-swagger; DO NOT EDIT.

package operations

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	"io"
	"net/http"

	"github.com/go-openapi/errors"
	"github.com/go-openapi/runtime"
	"github.com/go-openapi/runtime/middleware"
	"github.com/go-openapi/validate"

	"myserver/models"
)

// NewAddPetParams creates a new AddPetParams object
//
// There are no default values defined in the spec.
func NewAddPetParams() AddPetParams {

	return AddPetParams{}
}

// AddPetParams contains all the bound params for the add pet operation
// typically these are obtained from a http.Request
//
// swagger:parameters addPet
type AddPetParams struct {

	// HTTP Request Object
	HTTPRequest *http.Request `json:"-"`

	/*Pet to add to the store
	  Required: true
	  In: body
	*/
	Pet *models.NewPet
}

// BindRequest both binds and validates a request, it assumes that complex things implement a Validatable(strfmt.Registry) error interface
// for simple values it will use straight method calls.
//
// To ensure default values, the struct must have been initialized with NewAddPetParams() beforehand.
func (o *AddPetParams) BindRequest(r *http.Request, route *middleware.MatchedRoute) error {
	var res []error

	o.HTTPRequest = r

	if runtime.HasBody(r) {
		defer r.Body.Close()
		var body models.NewPet
		if err := route.Consumer.Consume(r.Body, &body); err != nil {
			if err == io.EOF {
				res = append(res, errors.Required("pet", "body", ""))
			} else {
				res = append(res, errors.NewParseError("pet", "body", "", err))
			}
		} else {
			// validate body object
			if err := body.Validate(route.Formats); err != nil {
				res = append(res, err)
			}

			ctx := validate.WithOperationRequest(r.Context())
			if err := body.ContextValidate(ctx, route.Formats); err != nil {
				res = append(res, err)
			}

			if len(res) == 0 {
				o.Pet = &body
			}
		}
	} else {
		res = append(res, errors.Required("pet", "body", ""))
	}
	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}
