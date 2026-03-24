import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1742800000000 implements MigrationInterface {
  name = 'CreateUsersTable1742800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id char(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
        username varchar(191) NOT NULL,
        password_hash varchar(255) NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY UQ_users_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      INSERT INTO users (id, username, password_hash)
      VALUES (
        UUID(),
        'demo_user',
        '$2b$10$1a4O9PURy9xQBIWsKezbCux.Ba2b6kZ1xpeHKIN4IIe3vjsbpFGJG'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE users;');
  }
}
