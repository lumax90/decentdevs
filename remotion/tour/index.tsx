import { Composition, registerRoot } from 'remotion';
import { TOUR_FPS, TOUR_FRAMES, worldTourStops, type TourScene } from '../../src/lib/world-tour';
import { TennisScene } from './tennis';
import { ReactScene } from './react';
import { MobileScene, WebScene } from './devices';
import { DataScene, NextScene, RustScene } from './systems';
import { WorkflowScene } from './workflow';
import { FlutterScene, KotlinScene, SwiftScene, WebAppScene } from './applications';
import { GraphQLScene, NodeScene, PythonScene, RedisScene } from './data-flow';
import { CSharpScene, DockerScene, DotNetScene, GoScene } from './infrastructure';
import { TypeScriptScene, UnityScene, WebGLScene } from './interactive';

const scenes: Record<TourScene, React.FC> = { tennis: TennisScene, react: ReactScene, mobile: MobileScene, nextjs: NextScene, rust: RustScene, web: WebScene, data: DataScene, workflow: WorkflowScene, webapp: WebAppScene, nodejs: NodeScene, python: PythonScene, typescript: TypeScriptScene, flutter: FlutterScene, go: GoScene, swift: SwiftScene, kotlin: KotlinScene, csharp: CSharpScene, dotnet: DotNetScene, redis: RedisScene, docker: DockerScene, unity: UnityScene, graphql: GraphQLScene, webgl: WebGLScene };

function TourRoot() {
  return <>{worldTourStops.map(stop => <Composition key={stop.scene} id={stop.composition} component={scenes[stop.scene]} width={640} height={360} fps={TOUR_FPS} durationInFrames={TOUR_FRAMES} />)}</>;
}

registerRoot(TourRoot);
