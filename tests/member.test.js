const request = require('supertest');
const app = require('../index');

describe('Member User', () => {
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

    it("Sign In user", async () => {
        const user = {
            "email": "ouardini14+testingg@gmail.com",
            "password": "password",
        };
        const response = await request(app)
            .post("/users/Login")
            .send(user)
        expect(response.status).toBe(200);
        userId = response.body.user._id;
        accessToken = response.body.accessToken;
        console.log(response.body)
    });

    it("delete user ", async () => {
        const response = await request(app)
            .delete("/users")
            .set("Authorization", `Bearer ${accessToken}`);
        expect(response.status).toBe(204);
    });


});
