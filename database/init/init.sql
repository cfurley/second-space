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
    name character varying(255) NOT NULL,
    description text NOT NULL,
    background_color text NOT NULL,
    main_color text NOT NULL,
    caret_color text NOT NULL,
    sub_color text NOT NULL,
    sub_alt_color text NOT NULL,
    text_color text NOT NULL,
    error_color text NOT NULL,
    error_extra_color text NOT NULL,
    colorful_error_color text NOT NULL,
    colorful_error_extra_color text NOT NULL,
    create_date_utc timestamp(3) without time zone NOT NULL,
    update_date_utc timestamp(3) without time zone,
    delete_date_utc timestamp(3) without time zone,
    deleted smallint NOT NULL DEFAULT 0,
    CONSTRAINT themes_pkey PRIMARY KEY (id)
);

INSERT INTO themes(name, description, background_color, main_color,
caret_color, sub_color, sub_alt_color, text_color, error_color,
error_extra_color, colorful_error_color, colorful_error_extra_color, 
create_date_utc, update_date_utc, delete_date_utc, deleted)
VALUES
('cafe', 'Cafe test theme.', '#ceb18d', '#14120f', '#14120f',
'#d4d2d1', '#bba180', '#14120f', '#c82931', '#ac1823',
'#c82931', '#ac1823', NOW(), NULL, NULL, 0),
('honey', 'Honey test theme.', '#f2aa00', '#fff546', '#795200',
'#a66b00', '#e19e00', '#f3eecb', '#df3333', '#6d1f1f',
'#df3333', '#6d1f1f', NOW(), NULL, NULL, 0);

-- Holds the file information for user profile pictures.
CREATE TABLE IF NOT EXISTS public.profile_picture
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    filename character varying(255) COLLATE pg_catalog."default",
	filepath text COLLATE pg_catalog."default" NOT NULL,
    file_size integer NOT NULL,
    create_date_utc timestamp(3) without time zone NOT NULL,
    delete_date_utc timestamp(3) without time zone,
    deleted smallint NOT NULL DEFAULT 0,
    CONSTRAINT pk_id PRIMARY KEY (id)
);

INSERT INTO
profile_picture(filename, filepath, file_size, create_date_utc, 
delete_date_utc, deleted)
VALUES
('Filename test one.', 'Test/File/PathOne.jpg', 840, NOW(), NULL, 0),
('Filename test two.', 'Test/File/PathTwo.jpg', 600, NOW(), NULL, 0);

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
	last_login_date_utc timestamp(3) without time zone,
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

INSERT INTO "user"
(username, password, display_name, profile_picture_id, theme_id, 
first_name, last_name, create_date_utc, update_date_utc, 
delete_date_utc, deleted, last_login_date_utc)
VALUES
('Test user one', 'Pass12345', 'Display Name One', 1, 1, 'FirstOne', 
'LastOne', NOW(), NULL, NULL, 0, NOW()),
('Test user two', 'Password123', 'Display Name Two', 2, 2, 'FirstTwo', 
'LastTwo', NOW(), NULL, NULL, 0, NOW());

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

INSERT INTO space (created_by_user_id, title, icon, create_date_utc, 
update_date_utc, delete_date_utc, deleted)
VALUES
(1, 'My first space!', '🧡', NOW(), NULL, NULL, 0),
(1, 'Second Space!', '🧡🧡', NOW(), NULL, NULL, 0),
(1, 'Pictures Space', '🧡', NOW(), NULL, NULL, 0),
(1, 'Food Space', '🧡🧡', NOW(), NULL, NULL, 0);



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

INSERT INTO space_ordering(space_id, user_id, "order")
VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 1),
(4, 2, 2);

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

INSERT INTO space_viewing_history(space_id, user_id, last_viewed_date_utc,
view_count, create_date_utc, delete_date_utc, deleted)
VALUES
(1, 1, NOW(), 1, NOW(), NULL, 0),
(2, 1, NOW(), 1, NOW(), NULL, 0),
(3, 2, NOW(), 1, NOW(), NULL, 0),
(4, 2, NOW(), 1, NOW(), NULL, 0);

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
INSERT INTO public.containers (
    space_id,
    title,
    link,
    viewed_date_utc,
    container_type_id,
    created_by_user_id,
    create_date_utc,
    update_date_utc,
    delete_date_utc,
    deleted
)
VALUES
    (1, 'Title 1', NULL, NOW(), 1, 1, NOW(), NULL, NULL, 0),
    (2, 'Title 2', NULL, NOW(), 1, 1, NOW(), NULL, NULL, 0),
    (3, 'Title 3', NULL, NOW(), 1, 1, NOW(), NULL, NULL, 0),
    (4, 'Title 4', NULL, NOW(), 1, 1, NOW(), NULL, NULL, 0);

-- Media holds files that are connected to media containers.
CREATE TABLE IF NOT EXISTS public.media
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
	container_id bigint NOT NULL,
	filename character varying(255) COLLATE pg_catalog."default" NOT NULL,
    filepath text COLLATE pg_catalog."default" NOT NULL,
    file_size integer NOT NULL,
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