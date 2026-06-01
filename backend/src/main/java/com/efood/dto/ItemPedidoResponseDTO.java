package com.efood.dto;

import com.efood.model.ItemPedido;

import java.math.BigDecimal;

public class ItemPedidoResponseDTO {

    private Long id;
    private ProdutoResponseDTO produto;
    private Integer quantidade;
    private BigDecimal precoUnitario;
    private BigDecimal subtotal;

    public static ItemPedidoResponseDTO fromEntity(ItemPedido item) {
        ItemPedidoResponseDTO dto = new ItemPedidoResponseDTO();
        dto.id = item.getId();
        dto.produto = ProdutoResponseDTO.fromEntity(item.getProduto());
        dto.quantidade = item.getQuantidade();
        dto.precoUnitario = item.getPrecoUnitario();
        dto.subtotal = item.getPrecoUnitario().multiply(BigDecimal.valueOf(item.getQuantidade()));
        return dto;
    }

    public Long getId() { return id; }
    public ProdutoResponseDTO getProduto() { return produto; }
    public Integer getQuantidade() { return quantidade; }
    public BigDecimal getPrecoUnitario() { return precoUnitario; }
    public BigDecimal getSubtotal() { return subtotal; }
}
