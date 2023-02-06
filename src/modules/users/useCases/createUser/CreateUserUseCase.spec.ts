import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com",
      password: "1234"
    });

    expect(user).toHaveProperty("id");
  });

  it("Should not be able to create a new user with same email", async () => {
    await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com",
      password: "1234"
    });

    await expect(
      createUserUseCase.execute({
        name: "User Test",
        email: "user@test.com",
        password: "1234"
      })
    ).rejects.toEqual(new CreateUserError());
  });

});