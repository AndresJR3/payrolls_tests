// src/controllers/payrollController.js
const { pool } = require('../config/database');

const getAllPayrolls = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'created_at', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    // se elimino el updated_at de la consulta
    const result = await pool.query(
      `SELECT id, employee_name, salary, pay_date, created_at, updated_at
       FROM payrolls
       WHERE user_id = $1
       ORDER BY ${sortBy} ${order}
       LIMIT $2 OFFSET $3`,
      [req.user.userId, limit, offset]
    );

    // Contar total de registros para paginación
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM payrolls WHERE user_id = $1',
      [req.user.userId]
    );

    const totalRecords = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      payrolls: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecords,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    next(error);
  }
};

const getPayrollById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM payrolls WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Nómina no encontrada',
        message: 'La nómina especificada no existe o no tienes permisos para verla'
      });
    }

    res.json({
      payroll: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};

const createPayroll = async (req, res, next) => {
  try {
    const { employee_name, salary, pay_date } = req.body;

    // Validaciones
    if (!employee_name || !salary || !pay_date) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Nombre del empleado, salario y fecha de pago son requeridos'
      });
    }

    if (salary <= 0) {
      return res.status(400).json({
        error: 'Salario inválido',
        message: 'El salario debe ser mayor a 0'
      });
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(pay_date)) {
      return res.status(400).json({
        error: 'Formato de fecha inválido',
        message: 'La fecha debe estar en formato YYYY-MM-DD'
      });
    }

    const newPayroll = await pool.query(
      `INSERT INTO payrolls (user_id, employee_name, salary, pay_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.userId, employee_name.trim(), salary, pay_date]
    );

    res.status(201).json({
      message: 'Nómina creada exitosamente',
      payroll: newPayroll.rows[0]
    });

  } catch (error) {
    next(error);
  }
};

const updatePayroll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employee_name, salary, pay_date } = req.body;

    // Verificar que la nómina existe y pertenece al usuario
    const existingPayroll = await pool.query(
      'SELECT * FROM payrolls WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (existingPayroll.rows.length === 0) {
      return res.status(404).json({
        error: 'Nómina no encontrada',
        message: 'La nómina especificada no existe o no tienes permisos para modificarla'
      });
    }

    // Validaciones opcionales (solo si se proporcionan)
    if (salary !== undefined && salary <= 0) {
      return res.status(400).json({
        error: 'Salario inválido',
        message: 'El salario debe ser mayor a 0'
      });
    }

    if (pay_date !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(pay_date)) {
        return res.status(400).json({
          error: 'Formato de fecha inválido',
          message: 'La fecha debe estar en formato YYYY-MM-DD'
        });
      }
    }

    // Construir query dinámico solo con campos proporcionados
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (employee_name !== undefined) {
      updateFields.push(`employee_name = $${paramCount}`);
      updateValues.push(employee_name.trim());
      paramCount++;
    }

    if (salary !== undefined) {
      updateFields.push(`salary = $${paramCount}`);
      updateValues.push(salary);
      paramCount++;
    }

    if (pay_date !== undefined) {
      updateFields.push(`pay_date = $${paramCount}`);
      updateValues.push(pay_date);
      paramCount++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id, req.user.userId);

    const query = `
      UPDATE payrolls
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const updatedPayroll = await pool.query(query, updateValues);

    res.json({
      message: 'Nómina actualizada exitosamente',
      payroll: updatedPayroll.rows[0]
    });

  } catch (error) {
    next(error);
  }
};

const deletePayroll = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedPayroll = await pool.query(
      'DELETE FROM payrolls WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (deletedPayroll.rows.length === 0) {
      return res.status(404).json({
        error: 'Nómina no encontrada',
        message: 'La nómina especificada no existe o no tienes permisos para eliminarla'
      });
    }

    res.json({
      message: 'Nómina eliminada exitosamente',
      payroll: deletedPayroll.rows[0]
    });

  } catch (error) {
    next(error);
  }
};

const getPayrollStats = async (req, res, next) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_payrolls,
        SUM(salary) as total_salary,
        AVG(salary) as average_salary,
        MAX(salary) as highest_salary,
        MIN(salary) as lowest_salary,
        COUNT(DISTINCT employee_name) as unique_employees
      FROM payrolls
      WHERE user_id = $1
    `, [req.user.userId]);

    const monthlyStats = await pool.query(`
      SELECT
        DATE_TRUNC('month', pay_date) as month,
        COUNT(*) as payrolls_count,
        SUM(salary) as total_paid
      FROM payrolls
      WHERE user_id = $1
      GROUP BY DATE_TRUNC('month', pay_date)
      ORDER BY month DESC
      LIMIT 12
    `, [req.user.userId]);

    res.json({
      general: stats.rows[0],
      monthly: monthlyStats.rows
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPayrolls,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
  getPayrollStats
};
