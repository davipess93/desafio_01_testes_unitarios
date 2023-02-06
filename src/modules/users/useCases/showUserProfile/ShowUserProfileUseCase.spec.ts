import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
  });

  it("Should be able to show a user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com",
      password: "1234"
    });

    const userFound = await showUserProfileUseCase.execute(user.id as string);

    expect(userFound).toHaveProperty("name", user.name);
    expect(userFound).toHaveProperty("email", user.email);
  });

  it("Should not be able to show a non-existent user profile", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("fake_id");
    }).rejects.toBeInstanceOf(AppError);
  });
})