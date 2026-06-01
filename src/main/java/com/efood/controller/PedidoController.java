package com.efood.controller;

import com.efood.model.Pedido;
import com.efood.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pedidos")
@CrossOrigin(origins = "*") // Permite integração futura com o frontend de forma simples
public class PedidoController {

    @Autowired
    private PedidoService service;

    // GET /pedidos - listar todos pedidos
    @GetMapping
    public ResponseEntity<List<Pedido>> listarTodos() {
        List<Pedido> pedidos = service.listarTodos();
        return ResponseEntity.ok(pedidos);
    }

    // GET /pedidos/{id} - buscar pedido pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /pedidos - criar pedido
    @PostMapping
    public ResponseEntity<Pedido> criar(@RequestBody Pedido pedido) {
        Pedido novoPedido = service.criar(pedido);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoPedido);
    }

    // PUT /pedidos/{id} - atualizar pedido pelo ID
    @PutMapping("/{id}")
    public ResponseEntity<Pedido> atualizar(@PathVariable Long id, @RequestBody Pedido pedido) {
        try {
            Pedido pedidoAtualizado = service.atualizar(id, pedido);
            return ResponseEntity.ok(pedidoAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /pedidos/{id} - deletar pedido pelo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            service.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}