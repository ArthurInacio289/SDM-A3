package com.efood.service;

import com.efood.dto.ProdutoRequestDTO;
import com.efood.dto.ProdutoResponseDTO;
import com.efood.exception.RecursoNaoEncontradoException;
import com.efood.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository repository;

    public List<ProdutoResponseDTO> listarTodos(String categoria, Boolean disponivel) {
        var produtos = (categoria != null && !categoria.isBlank())
                ? (Boolean.TRUE.equals(disponivel)
                        ? repository.findByCategoriaIgnoreCaseAndDisponivelTrue(categoria)
                        : repository.findByCategoriaIgnoreCase(categoria))
                : (Boolean.TRUE.equals(disponivel)
                        ? repository.findByDisponivelTrue()
                        : repository.findAll());

        return produtos.stream().map(ProdutoResponseDTO::fromEntity).toList();
    }

    public List<String> listarCategorias() {
        return repository.findAllCategorias();
    }

    public ProdutoResponseDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(ProdutoResponseDTO::fromEntity)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado com o ID: " + id));
    }

    public ProdutoResponseDTO criar(ProdutoRequestDTO dto) {
        return ProdutoResponseDTO.fromEntity(repository.save(dto.toEntity()));
    }

    public ProdutoResponseDTO atualizar(Long id, ProdutoRequestDTO dto) {
        var produto = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado com o ID: " + id));
        produto.setNome(dto.getNome());
        produto.setDescricao(dto.getDescricao());
        produto.setPreco(dto.getPreco());
        produto.setCategoria(dto.getCategoria());
        produto.setDisponivel(dto.isDisponivel());
        return ProdutoResponseDTO.fromEntity(repository.save(produto));
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Produto não encontrado com o ID: " + id);
        }
        repository.deleteById(id);
    }
}
