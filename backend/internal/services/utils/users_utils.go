package utils

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

// Check valid gender:
func IsValidGender(gender string) bool {
	return gender == "Male" || gender == "Female"
}

// HashPassword takes a plain text password and returns a bcrypt hash
func HashPassword(password string) (string, error) {
	fmt.Println(password)
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password),bcrypt.DefaultCost) // default cost
	if err != nil {
		return "", fmt.Errorf("error hashing password: %w", err)
	}
	return string(hashedBytes), nil
}

func CheckPasswordHash(password, hash string) error {
	if password == "" || hash == "" {
		return fmt.Errorf("password and hash must not be empty")
	}
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}
