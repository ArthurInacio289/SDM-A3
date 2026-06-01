package com.efood.dto;

import com.efood.model.Produto;

import java.math.BigDecimal;

public class ProdutoResponseDTO {

    private Long id;
    private String nome;
    private String descricao;
    private BigDecimal preco;
    private String categoria;
    private boolean disponivel;

    public static ProdutoResponseDTO fromEntity(Produto produto) {
        ProdutoResponseDTO dto = new ProdutoResponseDTO();
        dto.id = produto.getId();
        dto.nome = produto.getNome();
        dto.descricao = produto.getDescricao();
        dto.preco = produto.getPreco();
        dto.categoria = produto.getCategoria();
        dto.disponivel = produto.isDisponivel();
        return dto;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public BigDecimal getPreco() { return preco; }
    public String getCategoria() { return categoria; }
    public boolean isDisponivel() { return disponivel; }
}
