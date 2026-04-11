package com.trustspot.userservice.dto;

// A DTO (Data Transfer Object) is a simple Java class used to carry data between different layers of your application, especially between the client and server.
// It does not contain business logic or database mapping. It only holds data.
// A DTO is a simple object used to transfer data safely between client and server without exposing database entities.
// Without DTO: Customer walks into kitchen and touches everything
// With DTO: Customer only fills an order form
public class RegisterRequest {

    private String name;
    private String email;
    private String password;
    
    public String getName(){
        return name;
    }

    public String getEmail(){
        return email;
    }

    public String getPassword(){
        return password;
    }

    public void setName(String name){
        this.name = name;
    }

    public void setEmail(String email){
        this.email = email;
    }

    public void setPassword(String password){
        this.password = password;
    }
}