package com.efood.service;

import com.efood.dto.ClienteRequestDTO;
import com.efood.dto.ClienteResponseDTO;
import com.efood.exception.RecursoNaoEncontradoException;
import com.efood.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository repository;

    public List<ClienteResponseDTO> listarTodos() {
        return repository.findAll().stream()
                .map(ClienteResponseDTO::fromEntity)
                .toList();
    }

    public ClienteResponseDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(ClienteResponseDTO::fromEntity)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado com o ID: " + id));
    }

    public ClienteResponseDTO buscarPorEmail(String email) {
        return repository.findByEmail(email)
                .map(ClienteResponseDTO::fromEntity)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado com o email: " + email));
    }

    public ClienteResponseDTO criar(ClienteRequestDTO dto) {
        if (repository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Já existe um cliente cadastrado com o email: " + dto.getEmail());
        }
        return ClienteResponseDTO.fromEntity(repository.save(dto.toEntity()));
    }

    public ClienteResponseDTO atualizar(Long id, ClienteRequestDTO dto) {
        var cliente = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado com o ID: " + id));
        cliente.setNome(dto.getNome());
        cliente.setEmail(dto.getEmail());
        cliente.setTelefone(dto.getTelefone());
        cliente.setEndereco(dto.getEndereco());
        return ClienteResponseDTO.fromEntity(repository.save(cliente));
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Cliente não encontrado com o ID: " + id);
        }
        repository.deleteById(id);
    }
}
