package com.efood.dto;

import com.efood.model.StatusPedido;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateDTO {

    @NotNull(message = "Status é obrigatório")
    private StatusPedido status;

    public StatusPedido getStatus() { return status; }
    public void setStatus(StatusPedido status) { this.status = status; }
}
