import authConfig from "../../../../config/auth";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    authConfig.jwt.secret = "supersenha";
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
  });

  it("Should be able to authenticate an user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com",
      password: "1234"
    });

    const auth = await authenticateUserUseCase.execute({
      email: user.email,
      password: "1234",
    });

    expect(auth).toHaveProperty("token");
  });

  it("Should not be able to authenticate an user with email or password incorrect", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com",
      password: "1234"
    });

    await expect(
      authenticateUserUseCase.execute({
        email: user.email,
        password: "Wrong password",
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });

  it("Should not be able to authenticate with a non-exitent user", async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: "non-existent@email.com",
        password: "123456",
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  })
})