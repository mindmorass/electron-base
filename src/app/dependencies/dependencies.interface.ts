export interface DependenciesInterface {
  name: string,
  pre_install_cmds?: string[],
  install_cmd?: string,
  package_manager?: 'brew' | 'npm' | 'pip' | 'installer' | 'hdiutil',
  documentation?: string,
}
