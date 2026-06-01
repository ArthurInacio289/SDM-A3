package com.efood.repository;

import com.efood.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    List<Produto> findByDisponivelTrue();
    List<Produto> findByCategoriaIgnoreCase(String categoria);
    List<Produto> findByCategoriaIgnoreCaseAndDisponivelTrue(String categoria);

    @Query("SELECT DISTINCT p.categoria FROM Produto p ORDER BY p.categoria")
    List<String> findAllCategorias();
}
