package com.efood.dto;

import com.efood.model.Pedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PedidoResponseDTO {

    private Long id;
    private ClienteResponseDTO cliente;
    private List<ItemPedidoResponseDTO> itens;
    private BigDecimal valorTotal;
    private String status;
    private String enderecoEntrega;
    private LocalDateTime dataPedido;

    public static PedidoResponseDTO fromEntity(Pedido pedido) {
        PedidoResponseDTO dto = new PedidoResponseDTO();
        dto.id = pedido.getId();
        dto.cliente = ClienteResponseDTO.fromEntity(pedido.getCliente());
        dto.itens = pedido.getItens().stream()
                .map(ItemPedidoResponseDTO::fromEntity)
                .toList();
        dto.valorTotal = pedido.getValorTotal();
        dto.status = pedido.getStatus().name();
        dto.enderecoEntrega = pedido.getEnderecoEntrega();
        dto.dataPedido = pedido.getDataPedido();
        return dto;
    }

    public Long getId() { return id; }
    public ClienteResponseDTO getCliente() { return cliente; }
    public List<ItemPedidoResponseDTO> getItens() { return itens; }
    public BigDecimal getValorTotal() { return valorTotal; }
    public String getStatus() { return status; }
    public String getEnderecoEntrega() { return enderecoEntrega; }
    public LocalDateTime getDataPedido() { return dataPedido; }
}
