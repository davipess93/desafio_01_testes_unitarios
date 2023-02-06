import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../createStatement/CreateStatementController";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    statementRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementRepositoryInMemory
    );
    getBalanceUseCase = new GetBalanceUseCase(
      statementRepositoryInMemory,
      usersRepositoryInMemory
    );
  });

  it("Should be able to get a balance from an user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com",
      password: "1234"
    });

    const user_id = user.id as string;
    
    await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Deposit test"
    });

    const balance = await getBalanceUseCase.execute({ user_id });

    expect(balance).toHaveProperty("balance", 100);
    expect(balance).toHaveProperty("statement");
    expect(balance.statement[0].amount).toBe(100);
    expect(balance.statement[0].type).toBe("deposit");
    expect(balance.statement[0].description).toBe("Deposit test");
  });

  it("Should not be able to get a balanca from a non-existent user", async () => {
    expect(async () => {
      const user_id = "fake_id";

      await getBalanceUseCase.execute({ user_id });
    }).rejects.toBeInstanceOf(AppError);
  });
});