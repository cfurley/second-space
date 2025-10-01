-- Drop Tables, this will delete all data inside them
DROP TABLE IF EXISTS public.media CASCADE;
DROP TABLE IF EXISTS public.containers CASCADE;
DROP TABLE IF EXISTS public.container_type CASCADE;
DROP TABLE IF EXISTS public.shared_spaces_permission_log CASCADE;
DROP TABLE IF EXISTS public.shared_spaces CASCADE;
DROP TABLE IF EXISTS public.space_ordering CASCADE;
DROP TABLE IF EXISTS public.space_viewing_history CASCADE;
DROP TABLE IF EXISTS public.space CASCADE;
DROP TABLE IF EXISTS public.themes CASCADE;
DROP TABLE IF EXISTS public.profile_picture CASCADE;
DROP TABLE IF EXISTS public."user" CASCADE;

-- Holds information about themes such as the font, background color, text color, etc.
-- TODO: Add attribute columns!
CREATE TABLE IF NOT EXISTS public.themes
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    attributes_placeholder smallint,
    create_date_utc timestamp(3) without time zone NOT NULL,
    update_date_utc timestamp(3) without time zone,
    delete_date_utc timestamp(3) without time zone,
    deleted smallint NOT NULL DEFAULT 0,
    CONSTRAINT themes_pkey PRIMARY KEY (id)
);

-- Holds the file information for user profile pictures.
CREATE TABLE IF NOT EXISTS public.profile_picture
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    filename character varying(255) COLLATE pg_catalog."default",
	filepath text COLLATE pg_catalog."default" NOT NULL,
    file_size smallint NOT NULL,
    create_date_utc timestamp(3) without time zone NOT NULL,
    delete_date_utc timestamp(3) without time zone,
    deleted smallint NOT NULL DEFAULT 0,
    CONSTRAINT pk_id PRIMARY KEY (id)
);

-- Holds the types of containers (text, media, etc). Acts as an enumerator.
CREATE TABLE IF NOT EXISTS public.container_type
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description character varying(255) COLLATE pg_catalog."default" NOT NULL,
    create_date_utc timestamp(3) without time zone NOT NULL,
    update_date_utc timestamp(3) without time zone,
    delete_date_utc timestamp(3) without time zone,
    deleted smallint NOT NULL DEFAULT 0,
    CONSTRAINT container_type_pkey PRIMARY KEY (id)
);

INSERT INTO public.container_type (name, description, create_date_utc, update_date_utc, delete_date_utc, deleted)
VALUES 
('Text', 'A container with text only.', NOW(), NULL, NULL, 0),
('Video', 'A container with a video.', NOW(), NULL, NULL, 0),
('Image', 'A container with an image.', NOW(), NULL, NULL, 0),
('Link', 'A container with a link.', NOW(), NULL, NULL, 0);


-- Holds information on our user accounts. Currently has nothing for passwords or authentication.
CREATE TABLE IF NOT EXISTS public."user"
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    username character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    display_name character varying(255) COLLATE pg_catalog."default",
    profile_picture_id bigint,
    theme_id integer NOT NULL DEFAULT 1,
    first_name character varying(255) COLLATE pg_catalog."default",
    last_name character varying(255) COLLATE pg_catalog."default", 
    full_name character varying(255) COLLATE pg_catalog."default" GENERATED ALWAYS AS ((((first_name)::text || ' '::text) || (last_name)::text)) STORED,
    timezone character varying(255) COLLATE pg_catalog."default",
	last_login_date_utc timestamp(3) without time zone NOT NULL,
	create_date_utc timestamp(3) without time zone NOT NULL,
    update_date_utc timestamp(3) without time zone,
    delete_date_utc timestamp(3) without time zone,
    deleted smallint NOT NULL DEFAULT 0,
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT fk_profileid FOREIGN KEY (profile_picture_id) 
        REFERENCES public.profile_picture (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_themeid FOREIGN KEY (theme_id)
        REFERENCES public.themes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

-- Spaces hold containers and can be shared with other users.
CREATE TABLE IF NOT EXISTS public.space
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    created_by_user_id bigint NOT NULL,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    icon character varying(255) COLLATE pg_catalog."default",
    create_date_utc timestamp(3) without time zone NOT NULL,
    update_date_utc timestamp(3) without time zone,
    delete_date_utc timestamp(3) without time zone,
    deleted smallint NOT NULL DEFAULT 0,
    CONSTRAINT space_pkey PRIMARY KEY (id),
    CONSTRAINT fk_userid FOREIGN KEY (created_by_user_id)
        REFERENCES public."user" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE INDEX idx_space_user_deleted 
    ON public.space (created_by_user_id, deleted);

-- Space ordering keeps track of the ordering a user wants for their spaces. This keeps track of user id due to shared spaces.
CREATE TABLE IF NOT EXISTS public.space_ordering
(
    space_id bigint NOT NULL,
    user_id bigint NOT NULL,
    "order" smallint NOT NULL,
    CONSTRAINT pk_space_id_order PRIMARY KEY (user_id, space_id, "order"),
    CONSTRAINT fk_space_id FOREIGN KEY (space_id)
        REFERENCES public.space (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_userid FOREIGN KEY (user_id)
        REFERENCES public."user" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

-- Space viewing history shows the last viewed date and view count for every space.
CREATE TABLE IF NOT EXISTS public.space_viewing_history
(
    space_id bigint NOT NULL,
    user_id bigint NOT NULL,
    last_viewed_date_utc timestamp(3) without time zone NOT NULL,
    view_count integer NOT NULL DEFAULT 1,
    create_date_utc timestamp(3) without time zone NOT NULL,
    update_date_utc timestamp(3) without time zone,
    delete_date_utc timestamp(3) without time zone,
    deleted smallint NOT NULL DEFAULT 0,
    CONSTRAINT pk_spaceid_userid PRIMARY KEY (space_id, user_id),
    CONSTRAINT fk_spaceid FOREIGN KEY (space_id)
        REFERENCES public.space (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_userid FOREIGN KEY (user_id)
        REFERENCES public."user" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

-- Shared spaces relies on user and space.
CREATE TABLE IF NOT EXISTS public.shared_spaces
(
    space_id bigint NOT NULL DEFAULT 0,
    shared_with_user_id bigint NOT NULL DEFAULT 0,
    add_self_containers smallint NOT NULL DEFAULT 0,
    delete_self_containers smallint NOT NULL DEFAULT 0,
    update_self_containers smallint NOT NULL DEFAULT 0,
    edit_owner_containers smallint NOT NULL DEFAULT 0,
    delete_owner_containers smallint NOT NULL DEFAULT 0,
    update_space_name smallint NOT NULL DEFAULT 0,
    access_given_date timestamp(3) without time zone NOT NULL,
    CONSTRAINT shared_spaces_pkey PRIMARY KEY (shared_with_user_id, space_id),
    CONSTRAINT fk_shared_with_user_id FOREIGN KEY (shared_with_user_id)
        REFERENCES public."user" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_spaceid FOREIGN KEY (space_id)
        REFERENCES public.space (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

-- Shared spaces permission log relies on shared spaces.
CREATE TABLE IF NOT EXISTS public.shared_spaces_permission_log
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    space_id bigint NOT NULL,
    shared_with_user_id bigint NOT NULL,
    add_self_containers smallint NOT NULL DEFAULT 0,
    delete_self_containers smallint NOT NULL DEFAULT 0,
    update_self_containers smallint NOT NULL DEFAULT 0,
    edit_owner_containers smallint NOT NULL DEFAULT 0,
    delete_owner_containers smallint NOT NULL DEFAULT 0,
    update_space_name smallint NOT NULL DEFAULT 0,
    remove_access smallint NOT NULL DEFAULT 0,
    create_date_utc timestamp(3) without time zone NOT NULL,
    update_date_utc timestamp(3) without time zone,
    delete_date_utc timestamp(3) without time zone,
    deleted smallint NOT NULL DEFAULT 0,
    CONSTRAINT shared_space_permission_log_pkey PRIMARY KEY (id),
    CONSTRAINT fk_space_id FOREIGN KEY (space_id)
        REFERENCES public.space (id) MATCH SIMPLE
        ON UPDATE NO ACTION 
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_user_id FOREIGN KEY (shared_with_user_id) 
        REFERENCES public."user" (id) MATCH SIMPLE
        ON UPDATE NO ACTION 
        ON DELETE NO ACTION
        NOT VALID
);

CREATE INDEX idx_sspl_space_deleted_user 
    ON public.shared_spaces_permission_log (space_id, deleted, shared_with_user_id);
CREATE INDEX idx_sspl_user_deleted 
    ON public.shared_spaces_permission_log (shared_with_user_id, deleted);


-- Containers hold media and are associated to spaces and container types.
CREATE TABLE IF NOT EXISTS public.containers
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    space_id bigint NOT NULL,
    title character varying(255) COLLATE pg_catalog."default",
    link character varying(255) COLLATE pg_catalog."default",
    viewed_date_utc timestamp(3) without time zone NOT NULL,
    container_type_id smallint NOT NULL,
    created_by_user_id bigint NOT NULL,
    create_date_utc timestamp(3) without time zone NOT NULL,
    update_date_utc timestamp(3) without time zone,
    delete_date_utc timestamp(3) without time zone,
    deleted smallint NOT NULL DEFAULT 0,
    CONSTRAINT containers_pkey PRIMARY KEY (id),
    CONSTRAINT fk_containertypeid_containertype FOREIGN KEY (container_type_id)
        REFERENCES public.container_type (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_spaceid FOREIGN KEY (space_id)
        REFERENCES public.space (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_userid FOREIGN KEY (created_by_user_id)
        REFERENCES public."user" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
); 

CREATE INDEX idx_containers_space_deleted
    ON public.containers (space_id, deleted);
CREATE INDEX idx_containers_user_deleted
    ON public.containers (created_by_user_id, deleted);

-- Media holds files that are connected to media containers.
CREATE TABLE IF NOT EXISTS public.media
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
	container_id bigint NOT NULL,
	filename character varying(255) COLLATE pg_catalog."default" NOT NULL,
    filepath text COLLATE pg_catalog."default" NOT NULL,
    file_size smallint NOT NULL,
    video_length double precision,
    create_date_utc timestamp(3) without time zone NOT NULL,
    update_date_utc timestamp(3) without time zone,
    delete_date_utc timestamp(3) without time zone,
	deleted smallint NOT NULL DEFAULT 0,
    CONSTRAINT media_pkey PRIMARY KEY (id),
    CONSTRAINT fk_containerid_container FOREIGN KEY (container_id)
        REFERENCES public.containers (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
CREATE INDEX idx_media_container_deleted
    ON public.media (container_id, deleted);