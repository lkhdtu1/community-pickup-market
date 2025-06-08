import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import bcrypt from 'bcryptjs';

/**
 * Enum for user roles.
 */
export enum UserRole {
  CUSTOMER = 'customer',
  PRODUCER = 'producer',
}

/**
 * User entity representing application users.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ type: 'jsonb', nullable: true })
  profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Hash the password before saving if it has changed.
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPasswordIfNeeded(): Promise<void> {
    if (this.password && !this.password.startsWith('$2a$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  /**
   * Check if the provided password matches the stored hash.
   * @param password Plain text password to check
   * @returns Promise<boolean>
   */
  async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  /**
   * Hide sensitive fields when returning user objects.
   */
  toJSON() {
    const { password, ...user } = this;
    return user;
  }
}