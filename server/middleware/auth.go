package middleware

import (
	"io/ioutil"
	"net/http"
)

func ValidateJwt(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, err := ioutil.ReadAll(r.Body)
		defer func() {

			err := r.Body.Close()
			if err != nil {
				println(err)
			}
		}()
		if err != nil {
			println(err)
		}
		println(string(body))
	})
}
