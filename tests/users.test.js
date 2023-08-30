const request = require('supertest');
const app = require('../index');

describe('Users', () => {
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
        console.log(userId, accessToken)

    });

    it("returns user infos", async () => {
      const response = await request(app)
        .get("/users/UserInfo")
        .set("Authorization", `Bearer ${accessToken}`);
        console.log(response.body)
      expect(response.status).toBe(200);
    });

   it("delete user ", async () => {
        const response = await request(app)
            .delete("/users")
            .set("Authorization", `Bearer ${accessToken}`);
        expect(response.status).toBe(204);
    });


});
