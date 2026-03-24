import {
  TableColumn,
  TableIndex,
  type MigrationInterface,
  type QueryRunner,
} from "typeorm";

export class SwitchUsersToUsernameAuth1742801000000
  implements MigrationInterface
{
  name = "SwitchUsersToUsernameAuth1742801000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("users");

    if (!table) {
      return;
    }

    const hasUsername = table.findColumnByName("username");
    const hasEmail = table.findColumnByName("email");
    const hasDisplayName = table.findColumnByName("display_name");

    if (!hasUsername) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "username",
          type: "varchar",
          length: "191",
          isNullable: true,
        }),
      );
    }

    if (hasEmail) {
      await queryRunner.query(`
        UPDATE users
        SET username = COALESCE(
          NULLIF(username, ''),
          NULLIF(SUBSTRING_INDEX(email, '@', 1), ''),
          CONCAT('user_', REPLACE(SUBSTRING(id, 1, 8), '-', ''))
        )
      `);
    } else {
      await queryRunner.query(`
        UPDATE users
        SET username = COALESCE(
          NULLIF(username, ''),
          CONCAT('user_', REPLACE(SUBSTRING(id, 1, 8), '-', ''))
        )
      `);
    }

    await queryRunner.changeColumn(
      "users",
      "username",
      new TableColumn({
        name: "username",
        type: "varchar",
        length: "191",
        isNullable: false,
      }),
    );

    const usernameIndex = table.indices.find(
      (index) => index.name === "UQ_users_username",
    );

    if (!usernameIndex) {
      await queryRunner.createIndex(
        "users",
        new TableIndex({
          name: "UQ_users_username",
          columnNames: ["username"],
          isUnique: true,
        }),
      );
    }

    const emailIndex = table.indices.find((index) => index.name === "UQ_users_email");

    if (emailIndex) {
      await queryRunner.dropIndex("users", emailIndex);
    }

    if (hasEmail) {
      await queryRunner.dropColumn("users", "email");
    }

    if (hasDisplayName) {
      await queryRunner.dropColumn("users", "display_name");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("users");

    if (!table) {
      return;
    }

    const hasEmail = table.findColumnByName("email");
    const hasDisplayName = table.findColumnByName("display_name");
    const hasUsername = table.findColumnByName("username");
    const usernameIndex = table.indices.find(
      (index) => index.name === "UQ_users_username",
    );

    if (!hasEmail) {
      await queryRunner.addColumn(
        "users",
        new TableColumn({
          name: "email",
          type: "varchar",
          length: "191",
          isNullable: true,
        }),
      );
    }

    if (!hasDisplayName) {
      await queryRunner.addColumn(
        "users",
        new TableColumn({
          name: "display_name",
          type: "varchar",
          length: "64",
          isNullable: true,
        }),
      );
    }

    await queryRunner.query(`
      UPDATE users
      SET
        email = COALESCE(NULLIF(email, ''), CONCAT(username, '@local.dev')),
        display_name = COALESCE(NULLIF(display_name, ''), username)
    `);

    await queryRunner.changeColumn(
      "users",
      "email",
      new TableColumn({
        name: "email",
        type: "varchar",
        length: "191",
        isNullable: false,
      }),
    );

    await queryRunner.changeColumn(
      "users",
      "display_name",
      new TableColumn({
        name: "display_name",
        type: "varchar",
        length: "64",
        isNullable: false,
      }),
    );

    if (usernameIndex) {
      await queryRunner.dropIndex("users", usernameIndex);
    }

    const emailIndex = table.indices.find((index) => index.name === "UQ_users_email");

    if (!emailIndex) {
      await queryRunner.createIndex(
        "users",
        new TableIndex({
          name: "UQ_users_email",
          columnNames: ["email"],
          isUnique: true,
        }),
      );
    }

    if (hasUsername) {
      await queryRunner.dropColumn("users", "username");
    }
  }
}
