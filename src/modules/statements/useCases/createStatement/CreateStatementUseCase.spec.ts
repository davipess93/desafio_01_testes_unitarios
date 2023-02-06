import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "./CreateStatementController";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  usersRepositoryInMemory = new InMemoryUsersRepository();
  createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  statementRepositoryInMemory = new InMemoryStatementsRepository();
  createStatementUseCase = new CreateStatementUseCase(
    usersRepositoryInMemory,
    statementRepositoryInMemory
  );

  it("Should be able to do a deposit in an user account", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com",
      password: "1234"
    });

    const user_id = user.id as string;

    const createdStatement = await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Deposit test"
    });

    expect(createdStatement).toHaveProperty("id");
    expect(createdStatement).toHaveProperty("type", createdStatement.type);
  });

  it("Should be able to do a withdraw credit in an user account", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user2@test.com",
      password: "1234"
    });

    const user_id = user.id as string;

    await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Deposit test"
    });

    const createdStatement = await createStatementUseCase.execute({
      user_id,
      type: "withdraw" as OperationType,
      amount: 100,
      description: "Withdraw test"
    });

    expect(createdStatement).toHaveProperty("id");
    expect(createdStatement).toHaveProperty("type", createdStatement.type);
  });

  it("Should not be able to do a withdraw credit on insufficient funds", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User Test",
        email: "user2@test.com",
        password: "1234"
      });
  
      const user_id = user.id as string;
  
      await createStatementUseCase.execute({
        user_id,
        type: "withdraw" as OperationType,
        amount: 100,
        description: "Withdraw test"
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to do a deposit in a non-existent user account", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "take_id",
        type: "deposit" as OperationType,
        amount: 100,
        description: "Deposit test"
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to do a withdraw credit in a non-existent user account", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "take_id",
        type: "withdraw" as OperationType,
        amount: 100,
        description: "Deposit test"
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})