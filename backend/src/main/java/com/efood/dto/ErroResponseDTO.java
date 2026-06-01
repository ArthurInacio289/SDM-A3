package com.efood.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class ErroResponseDTO {

    private int status;
    private String mensagem;
    private LocalDateTime timestamp;
    private Map<String, String> erros;

    public ErroResponseDTO(int status, String mensagem, LocalDateTime timestamp, Map<String, String> erros) {
        this.status = status;
        this.mensagem = mensagem;
        this.timestamp = timestamp;
        this.erros = erros;
    }

    public int getStatus() { return status; }
    public String getMensagem() { return mensagem; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public Map<String, String> getErros() { return erros; }
}
