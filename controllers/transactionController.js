const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

// get user balance
const getBalance = async (req, res) => {
    const { email } = req;

    try {
        // get user ID first
        const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);

        if (users.length === 0 ) {
            return errorResponse(res, 108, 'Token tidak valid atau kadaluwarsa');
        }

        const userId = users[0].id;

        // Get balance 
        const [balances] = await pool.execute('SELECT balance FROM balances WHERE user_id = ?', [userId]);

        if (balances.length === 0) {
            return errorResponse(res, 108, 'Data tidka ditemukan');
        }

        return successResponse(res, 'Sukses', { balance: balances[0].balance });
    } catch (error) {
        console.error('Get balance error:', error);
        return errorResponse(res, 500, 'Terjadi kesalahan pada server');
    }
    
};

// topup balance 
const topup = async (req, res) => {
    const { email } = req;
    const amount = parseInt(req.body.amount);

    if (isNaN(amount) || amount <= 0) {
        return errorResponse(res, 102, 'Amount harus berupa angka positif');
    }

    try {
        // get user ID first 
        const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return errorResponse(res, 108, 'Token tidak valid atau kadaluwarsa');
        } 

        const userId = users[0].id;

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            const [balanceCheck] = await connection.execute('SELECT id FROM balances WHERE user_id = ?', [userId]);
            
            if (balanceCheck.length === 0) {
                await connection.execute('INSERT INTO balances (user_id, balance) VALUES (?, ?)', [userId, amount]);
            } else {
                await connection.execute('UPDATE balances SET balance = balance + ? WHERE user_id = ?', [amount, userId]);
            }

            // Generate invoice number
            const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            // create transaction record
            await connection.execute('INSERT INTO transactions (user_id, invoice_number, transaction_type, total_amount, description, created_on) VALUES (?, ?, ?, ?, ?, NOW())', 
                [userId, invoiceNumber, 'TOPUP', amount, 'Top Up Saldo']);

            await connection.commit();

            // get updated balance
            const [updatedBalance] = await pool.execute('SELECT balance FROM balances WHERE user_id = ?', [userId]);

            return successResponse(res, 'Top Up berhasil', { balance: updatedBalance[0].balance });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Top up error: ', error);
        return errorResponse(res, 500, 'Terjadi kesalahan pada server');
    }
};

// Create transaction (payment)
const createTransaction = async (req, res) => {
  const { email } = req;
  const { service_code, amount, transaction_type } = req.body;
  
  try {
    // Get user ID first
    const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return errorResponse(res, 108, 'Token tidak valid atau kadaluwarsa');
    }
    
    const userId = users[0].id;
    
    // Check if service exists
    const [services] = await pool.execute('SELECT * FROM services WHERE service_code = ?', [service_code]);
    
    if (services.length === 0) {
      return errorResponse(res, 102, 'Layanan tidak ditemukan');
    }
    
    const service = services[0];
    
    // Check user balance
    const [balances] = await pool.execute('SELECT balance FROM balances WHERE user_id = ?', [userId]);
    
    if (balances.length === 0) {
      return errorResponse(res, 108, 'Data tidak ditemukan');
    }
    
    const currentBalance = balances[0].balance;
    const totalAmount = parseInt(amount) + service.service_tariff;
    
    if (currentBalance < totalAmount) {
      return errorResponse(res, 102, 'Saldo tidak mencukupi');
    }
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update balance
      await connection.execute(
        'UPDATE balances SET balance = balance - ? WHERE user_id = ?',
        [totalAmount, userId]
      );
      
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Create transaction record
      await connection.execute(
        'INSERT INTO transactions (user_id, invoice_number, service_code, transaction_type, total_amount, description, created_on) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [userId, invoiceNumber, service_code, 'PAYMENT', totalAmount, `Pembayaran ${service.service_name}`]
      );
      
      await connection.commit();
      
      // Get updated balance
      const [updatedBalances] = await pool.execute('SELECT balance FROM balances WHERE user_id = ?', [userId]);
      
      return successResponse(res, 'Transaksi berhasil', { balance: updatedBalances[0].balance });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create transaction error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan pada server');
  }
};

// Get transaction history
const getHistory = async (req, res) => {
    console.log('Transaction History endpoint called');
    const { email } = req;
    
    try {
      // Log input parameters
      console.log('Request params:', { email });
      
      // Get user ID first
      console.log('Getting user ID...');
      const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
      console.log('Users query result:', users);
      
      if (users.length === 0) {
        return errorResponse(res, 108, 'Token tidak valid atau kadaluwarsa');
      }
      
      const userId = users[0].id;
      console.log('User ID found:', userId);
      
      console.log('Executing simplified transaction query...');
      const query = `
        SELECT 
          invoice_number, 
          transaction_type, 
          total_amount, 
          description,
          created_on
        FROM 
          transactions 
        WHERE 
          user_id = ? 
        ORDER BY 
          created_on DESC 
        LIMIT 10`;
      
      console.log('Query:', query);
      console.log('Query params:', [userId]);
      
      const [transactions] = await pool.execute(query, [userId]);
      console.log('Query success, result count:', transactions.length);
      
      const formattedTransactions = transactions.map(t => {
        return {
          invoice_number: t.invoice_number,
          transaction_type: t.transaction_type,
          total_amount: t.total_amount,
          description: t.description,
          created_on: String(t.created_on)
        };
      });
      
      console.log('Successfully formatted transactions');
      return successResponse(res, 'Sukses', { records: formattedTransactions });
    } catch (error) {
      console.error('Get history error details:', error.message);
      console.error('Error stack:', error.stack);
      return errorResponse(res, 500, 'Terjadi kesalahan pada server: ' + error.message);
    }
};

module.exports = {
    getBalance,
    topup,
    createTransaction,
    getHistory
};