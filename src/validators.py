from decimal import Decimal, InvalidOperation

def validar_calificacion(valor):
    # Rechazar valores nulos y booleanos (en Python bool es subclase de int)
    if valor is None or isinstance(valor, bool):
        raise ValueError("Calificación inválida: nulo o booleano")
    
    # Convertir a texto y verificar que no sea cadena vacía o con espacios
    texto = str(valor).strip()
    if not texto:
        raise ValueError("Calificación inválida: cadena vacía")
    
    # Convertir a Decimal de forma segura
    try:
        numero = Decimal(texto)
    except InvalidOperation:
        raise ValueError("Calificación inválida: formato no numérico")
    
    # Rechazar NaN, Infinity o -Infinity
    if not numero.is_finite():
        raise ValueError("Calificación inválida: no es un número finito")
    
    # Validar máximo 2 decimales sin redondear silenciosamente
    exponente = numero.as_tuple().exponent
    if isinstance(exponente, int) and exponente < -2:
        raise ValueError("Calificación inválida: máximo 2 decimales permitidos")
    
    # Validar rango estricto de 0 a 100
    if numero < Decimal("0") or numero > Decimal("100"):
        raise ValueError("Calificación inválida: fuera del rango 0 a 100")
    
    return numero