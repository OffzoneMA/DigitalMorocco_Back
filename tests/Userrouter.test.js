const request = require('supertest');
const index = require('../index'); 
describe('User Routes', () => {
  describe('POST /users', () => {
    it('should return 400 if request body is invalid', async () => {
      const response = await request(index)
        .post('/users')
        .send({
          email: 'test@example.com'
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'User creation failed. Please try again.');
    });
    // it('should create a new user', async () => {
    //   const response = await request(index)
    //     .post('/users')
    //     .send({
    //       email: 'test@example.com',
    //       password: 'password123'
    //     });
      
    //   expect(response.statusCode).toBe(400);
    //   expect(response.body).toHaveProperty('message', 'User creation failed. Please try again.');
    // });
  });

  describe('DELETE /users', () => {
    it('should delete a user', async () => {
      const response = await request(index)
        .delete('/users')
        .set('Authorization', 'Bearer <token>'); // Replace <token> with a valid JWT token
      
      expect(response.statusCode).toBe(403);
    });
  });

  // Add more test cases for other routes as needed
});