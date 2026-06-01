package com.efood.service;

import com.efood.model.Pedido;
import com.efood.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository repository;

    public List<Pedido> listarTodos() {
        return repository.findAll();
    }

    public Optional<Pedido> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Pedido criar(Pedido pedido) {
        if (pedido.getDataPedido() == null) {
            pedido.setDataPedido(LocalDateTime.now());
        }
        return repository.save(pedido);
    }

    public Pedido atualizar(Long id, Pedido dadosAtualizados) {
        return repository.findById(id).map(pedido -> {
            pedido.setCliente(dadosAtualizados.getCliente());
            pedido.setItens(dadosAtualizados.getItens());
            pedido.setValorTotal(dadosAtualizados.getValorTotal());
            pedido.setStatus(dadosAtualizados.getStatus());
            return repository.save(pedido);
        }).orElseThrow(() -> new RuntimeException("Pedido não encontrado com o ID: " + id));
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Pedido não encontrado com o ID: " + id);
        }
        repository.deleteById(id);
    }
}