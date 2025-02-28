from pulumi import export, Output, Config
from pulumi_gcp import container
from pulumi_docker import Image, DockerBuild


def create_container_registry():
    config = Config("gcp")
    project_id = config.require("project")
    registry = f"eu.gcr.io/{project_id}"
    image_name = "http-api"

    container.Registry("test-pulumi-registry", location="EU")
    registry_output = Output.from_input(registry)
    my_image = Image(
        "http-api",
        image_name=f"{registry}/{image_name}:v0.0.0",
        build=DockerBuild(context="./simple-http-api"),
    )
    export("image", my_image.image_name)
    export("registry", registry)
    return registry_output, my_image.image_name
