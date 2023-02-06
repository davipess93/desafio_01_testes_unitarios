import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../createStatement/CreateStatementController";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase

describe("Get Statement", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    statementRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementRepositoryInMemory
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementRepositoryInMemory
    );
  });

  it("Should be able to get a statement form an user", async () => {
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

    const statement_id = createdStatement.id as string;

    const returnedStatement = await getStatementOperationUseCase.execute({
      user_id,
      statement_id
    });

    expect(returnedStatement).toBeInstanceOf(Statement);
    expect(returnedStatement).toHaveProperty("id");
    expect(returnedStatement).toHaveProperty("type", "deposit");
    expect(returnedStatement).toHaveProperty("amount", 100);
  });

  it("Should not be able to get a statement form a non-existent user", async () => {
    expect(async () => {
      const user_id = "fake_id";

      const createdStatement = await createStatementUseCase.execute({
        user_id,
        type: "deposit" as OperationType,
        amount: 100,
        description: "Deposit test"
      });

      const statement_id = createdStatement.id as string;

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to get a statement form a non-existent statement", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User Test",
        email: "user@test.com",
        password: "1234"
      });
  
      const user_id = user.id as string;

      const statement_id = "fake_id";

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});