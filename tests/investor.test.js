const request = require('supertest');
const app = require('../index');

describe('Investor User', () => {
    let userId;
    let accessToken;

    it('should create a new user', async () => {
        const user = {
            "email": "ouardini14+testingg@gmail.com",
            "password": "password",
        };
        const response = await request(app)
            .post('/users')
            .send(user);

        expect(response.status).toBe(201);
        userId = response.body.user._id;
        accessToken = response.body.accessToken;
    });

    it('should complete the signup & choose the investor role ', async () => {
        const data = {
            "linkedin_link": "https://www.linkedin.com/me",
            "role": "investor",
        };
        const response = await request(app)
            .post('/users/complete_signup/'+userId)
            .send(data);

        expect(response.status).toBe(200);
    });

    it("delete user ", async () => {
        const response = await request(app)
            .delete("/users")
            .set("Authorization", `Bearer ${accessToken}`);
        expect(response.status).toBe(204);
    });


});
