package com.efood.dto;

import com.efood.model.Cliente;

public class ClienteResponseDTO {

    private Long id;
    private String nome;
    private String email;
    private String telefone;
    private String endereco;

    public static ClienteResponseDTO fromEntity(Cliente cliente) {
        ClienteResponseDTO dto = new ClienteResponseDTO();
        dto.id = cliente.getId();
        dto.nome = cliente.getNome();
        dto.email = cliente.getEmail();
        dto.telefone = cliente.getTelefone();
        dto.endereco = cliente.getEndereco();
        return dto;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getTelefone() { return telefone; }
    public String getEndereco() { return endereco; }
}
