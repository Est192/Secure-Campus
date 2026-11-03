def puede_modificar(user, student_id, group_id, con):
    if not user or user["role"] != "profesor":
        return False
    
    # Verificar que el grupo pertenezca al profesor autenticado y el alumno esté inscrito en él
    fila = con.execute(
        """
        SELECT 1
        FROM groups g
        JOIN enrollments e ON g.id = e.group_id
        WHERE g.id = ? AND g.professor_id = ? AND e.student_id = ?
        """,
        (group_id, user["id"], student_id),
    ).fetchone()
    return fila is not None


def puede_consultar(user, student_id, group_id, con):
    if not user:
        return False
    
    # Caso 1: Estudiante consultando su propia calificación en un grupo donde está inscrito
    if user["role"] == "estudiante":
        if user["id"] != student_id:
            return False
        fila = con.execute(
            "SELECT 1 FROM enrollments WHERE student_id = ? AND group_id = ?",
            (student_id, group_id),
        ).fetchone()
        return fila is not None

    # Caso 2: Profesor consultando a un alumno inscrito en uno de sus propios grupos
    if user["role"] == "profesor":
        return puede_modificar(user, student_id, group_id, con)

    # Administrador u otros roles no tienen acceso por defecto
    return False