package com.efood.controller;

import com.efood.dto.PedidoRequestDTO;
import com.efood.dto.PedidoResponseDTO;
import com.efood.dto.StatusUpdateDTO;
import com.efood.model.StatusPedido;
import com.efood.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService service;

    // GET /pedidos?status=PENDENTE&clienteId=1
    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> listarTodos(
            @RequestParam(required = false) StatusPedido status,
            @RequestParam(required = false) Long clienteId) {
        return ResponseEntity.ok(service.listarTodos(status, clienteId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    // GET /pedidos/cliente/{clienteId}
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<PedidoResponseDTO>> listarPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(service.listarTodos(null, clienteId));
    }

    @PostMapping
    public ResponseEntity<PedidoResponseDTO> criar(@Valid @RequestBody PedidoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
    }

    // PATCH /pedidos/{id}/status   body: {"status": "CONFIRMADO"}
    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoResponseDTO> atualizarStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateDTO dto) {
        return ResponseEntity.ok(service.atualizarStatus(id, dto.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
