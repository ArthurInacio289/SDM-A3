package com.efood.exception;

import com.efood.dto.ErroResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResponseDTO> handleNaoEncontrado(RecursoNaoEncontradoException ex) {
        ErroResponseDTO erro = new ErroResponseDTO(404, ex.getMessage(), LocalDateTime.now(), null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponseDTO> handleValidacao(MethodArgumentNotValidException ex) {
        Map<String, String> erros = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> erros.put(e.getField(), e.getDefaultMessage()));
        ErroResponseDTO erro = new ErroResponseDTO(400, "Erro de validação", LocalDateTime.now(), erros);
        return ResponseEntity.badRequest().body(erro);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErroResponseDTO> handleIllegalArgument(IllegalArgumentException ex) {
        ErroResponseDTO erro = new ErroResponseDTO(400, ex.getMessage(), LocalDateTime.now(), null);
        return ResponseEntity.badRequest().body(erro);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponseDTO> handleGenerico(Exception ex) {
        ErroResponseDTO erro = new ErroResponseDTO(500, "Erro interno do servidor", LocalDateTime.now(), null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
    }
}
