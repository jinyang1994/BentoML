import contextlib
import logging
import os
import time
import uuid

import docker

from bentoml.configuration import LAST_PYPI_RELEASE_VERSION
from bentoml.utils.tempdir import TempDirectory
from bentoml.yatai.deployment.utils import ensure_docker_available_or_raise

logger = logging.getLogger('bentoml.test')


def wait_until_container_ready(docker_container, timeout_seconds=60):
    start_time = time.time()
    while True:
        time.sleep(1)
        if docker_container.status == 'created':
            logger.info('Container logs')
            logger.info(docker_container.logs())
            break
        else:
            logger.info(f'Container status: {docker_container.status}')
        if time.time() - start_time > timeout_seconds:
            raise TimeoutError(f'Get container: {docker_container.name} timed out')
        else:
            continue


@contextlib.contextmanager
def local_yatai_server():
    ensure_docker_available_or_raise()
    docker_client = docker.from_env()
    local_bentoml_repo_path = os.path.abspath(__file__ + "/../../../../")
    yatai_docker_image_tag = f'bentoml/yatai-service:e2e-test-{uuid.uuid4().hex[:6]}'

    # Note: When set both `custom_context` and `fileobj`, docker api will not use the
    #       `path` provide... docker/api/build.py L138. The solution is create an actual
    #       Dockerfile along with path, instead of fileobj and custom_context.
    with TempDirectory() as temp_dir:
        temp_docker_file_path = os.path.join(temp_dir, 'Dockerfile')
        with open(temp_docker_file_path, 'w') as f:
            f.write(
                f"""\
FROM bentoml/yatai-service:{LAST_PYPI_RELEASE_VERSION}
ADD . /bentoml-local-repo
RUN pip install /bentoml-local-repo
            """
            )
        logger.info(f'building docker image {yatai_docker_image_tag}')
        docker_client.images.build(
            path=local_bentoml_repo_path,
            dockerfile=temp_docker_file_path,
            tag=yatai_docker_image_tag,
        )

        container_name = f'yatai-service-container-{uuid.uuid4().hex[:6]}'
        yatai_service_url = 'localhost:50051'
        container = docker_client.containers.run(
            image=yatai_docker_image_tag,
            environment=['BENTOML_HOME=/tmp'],
            ports={'50051/tcp': 50051},
            command=['bentoml', 'yatai-service-start', '--no-ui'],
            name=container_name,
            detach=True,
        )

        wait_until_container_ready(container)
        yield yatai_service_url

        logger.info(f"Shutting down docker container: {container_name}")
        container.kill()
