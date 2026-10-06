import * as THREE from "three";

const scratch = {
  camera: new THREE.Vector3(),
  self: new THREE.Vector3(),
  parent: new THREE.Quaternion(),
  euler: new THREE.Euler(),
};

/** Turn a node around its vertical axis so its front faces the camera, whatever its parent's rotation. */
export function faceCameraYaw(node: THREE.Object3D, camera: THREE.Camera) {
  camera.getWorldPosition(scratch.camera);
  node.getWorldPosition(scratch.self);
  const worldYaw = Math.atan2(scratch.camera.x - scratch.self.x, scratch.camera.z - scratch.self.z);
  const parentYaw = node.parent ? scratch.euler.setFromQuaternion(node.parent.getWorldQuaternion(scratch.parent), "YXZ").y : 0;
  node.rotation.y = worldYaw - parentYaw;
}
