package com.efood.repository;

import com.efood.model.Pedido;
import com.efood.model.StatusPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByStatus(StatusPedido status);
    List<Pedido> findByClienteId(Long clienteId);
    List<Pedido> findByClienteIdAndStatus(Long clienteId, StatusPedido status);
}
