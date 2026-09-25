function validar(schema) {
  return function(req, res, next) {
    const erros = [];

    for (const campo in schema) {
      const regras = schema[campo];
      const valor = req.body[campo];
      const ausente = valor === undefined || valor === null || valor === '';

      if (regras.obrigatorio && ausente) {
        erros.push(`O campo '${campo}' é obrigatório`);
        continue;
      }

      if (!ausente) {
  
        if (regras.tipo && typeof valor !== regras.tipo) {
          erros.push(`O campo '${campo}' deve ser do tipo ${regras.tipo}`);
        }

        if (regras.enum && !regras.enum.includes(valor)) {
          erros.push(`O campo '${campo}' deve ser um de: ${regras.enum.join(', ')}`);
        }

        if (regras.formato === 'email') {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!re.test(valor)) {
            erros.push(`O campo '${campo}' deve ser um email válido`);
          }
        }

  
        if (regras.minLength && valor.length < regras.minLength) {
          erros.push(`O campo '${campo}' deve ter ao menos ${regras.minLength} caracteres`);
        }

        
        if (regras.maxLength && valor.length > regras.maxLength) {
          erros.push(`O campo '${campo}' deve ter no máximo ${regras.maxLength} caracteres`);
        }
      }
    }

    if (erros.length > 0) {
      return res.status(400).json({ erros });
    }

    next();
  };
}

module.exports = validar;
