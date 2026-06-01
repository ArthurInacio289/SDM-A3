package com.efood.service;

import com.efood.dto.ItemPedidoRequestDTO;
import com.efood.dto.PedidoRequestDTO;
import com.efood.dto.PedidoResponseDTO;
import com.efood.exception.RecursoNaoEncontradoException;
import com.efood.model.*;
import com.efood.repository.ClienteRepository;
import com.efood.repository.PedidoRepository;
import com.efood.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    public List<PedidoResponseDTO> listarTodos(StatusPedido status, Long clienteId) {
        List<Pedido> pedidos;

        if (status != null && clienteId != null) {
            pedidos = pedidoRepository.findByClienteIdAndStatus(clienteId, status);
        } else if (status != null) {
            pedidos = pedidoRepository.findByStatus(status);
        } else if (clienteId != null) {
            pedidos = pedidoRepository.findByClienteId(clienteId);
        } else {
            pedidos = pedidoRepository.findAll();
        }

        return pedidos.stream().map(PedidoResponseDTO::fromEntity).toList();
    }

    public PedidoResponseDTO buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .map(PedidoResponseDTO::fromEntity)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado com o ID: " + id));
    }

    @Transactional
    public PedidoResponseDTO criar(PedidoRequestDTO dto) {
        Cliente cliente = clienteRepository.findById(dto.getClienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado com o ID: " + dto.getClienteId()));

        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setEnderecoEntrega(dto.getEnderecoEntrega());
        pedido.setDataPedido(LocalDateTime.now());
        pedido.setStatus(StatusPedido.PENDENTE);

        List<ItemPedido> itens = dto.getItens().stream().map(itemDto -> montarItem(itemDto, pedido)).toList();
        pedido.setItens(itens);
        pedido.setValorTotal(calcularTotal(itens));

        return PedidoResponseDTO.fromEntity(pedidoRepository.save(pedido));
    }

    public PedidoResponseDTO atualizarStatus(Long id, StatusPedido novoStatus) {
        return pedidoRepository.findById(id).map(pedido -> {
            pedido.setStatus(novoStatus);
            return PedidoResponseDTO.fromEntity(pedidoRepository.save(pedido));
        }).orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado com o ID: " + id));
    }

    public void deletar(Long id) {
        if (!pedidoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Pedido não encontrado com o ID: " + id);
        }
        pedidoRepository.deleteById(id);
    }

    private ItemPedido montarItem(ItemPedidoRequestDTO dto, Pedido pedido) {
        Produto produto = produtoRepository.findById(dto.getProdutoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado com o ID: " + dto.getProdutoId()));
        ItemPedido item = new ItemPedido();
        item.setPedido(pedido);
        item.setProduto(produto);
        item.setQuantidade(dto.getQuantidade());
        item.setPrecoUnitario(produto.getPreco());
        return item;
    }

    private BigDecimal calcularTotal(List<ItemPedido> itens) {
        return itens.stream()
                .map(item -> item.getPrecoUnitario().multiply(BigDecimal.valueOf(item.getQuantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
