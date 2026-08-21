CREATE TYPE "public"."ad_position" AS ENUM('banner_top', 'banner_bottom', 'sidebar_card', 'inline_card');--> statement-breakpoint
CREATE TYPE "public"."change_status" AS ENUM('pending', 'approved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."item_condition" AS ENUM('like_new', 'good', 'fair', 'worn');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "ad_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(128) NOT NULL,
	"image_url" text,
	"image_key" text,
	"destination_url" text NOT NULL,
	"position" "ad_position" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cron_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_name" varchar(128) NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"last_run_at" timestamp,
	"last_run_status" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cron_config_job_name_unique" UNIQUE("job_name")
);
--> statement-breakpoint
CREATE TABLE "program_changes" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_id" integer NOT NULL,
	"field_name" varchar(64) NOT NULL,
	"old_value" text,
	"new_value" text,
	"status" "change_status" DEFAULT 'pending' NOT NULL,
	"detected_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" integer
);
--> statement-breakpoint
CREATE TABLE "sports_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"sport_name" varchar(128) NOT NULL,
	"organization" varchar(256) NOT NULL,
	"town_area" varchar(128),
	"age_groups" varchar(256) NOT NULL,
	"age_min" integer,
	"age_max" integer,
	"registration_open_date" timestamp,
	"registration_close_date" timestamp,
	"program_start_date" timestamp,
	"program_end_date" timestamp,
	"website_url" text,
	"registration_url" text NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_checked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swap_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"sport_category" varchar(128) NOT NULL,
	"item_name" varchar(256) NOT NULL,
	"description" text,
	"size_info" varchar(128),
	"condition" "item_condition" NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"image_url" text,
	"image_key" text,
	"town_area" varchar(128),
	"poster_name" varchar(128) NOT NULL,
	"poster_email" varchar(320) NOT NULL,
	"poster_phone" varchar(32),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"name" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
